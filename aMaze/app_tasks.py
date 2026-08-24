import os
from flask import Flask, jsonify, send_from_directory, render_template_string
from bs4 import BeautifulSoup

app = Flask(__name__)

TEACHINGS_DIR = os.path.join(os.path.dirname(__file__), 'teachings')

def scan_teachings():
    """
    Recursively scans the teachings/ folder, reads HTML headers/titles,
    and returns a structured manifest dictionary.
    """
    tasks = {}
    
    if not os.path.exists(TEACHINGS_DIR):
        os.makedirs(TEACHINGS_DIR)
        
    # Walk through root and sub-groups recursively
    for root, dirs, files in os.walk(TEACHINGS_DIR):
        for file in files:
            if file.endswith('.html'):
                full_path = os.path.join(root, file)
                
                # Compute relative path for unique identifier/slug and URL mapping
                rel_dir = os.path.relpath(root, TEACHINGS_DIR)
                if rel_dir == '.':
                    group_path = ""
                    slug = file[:-5]
                else:
                    group_path = rel_dir.replace(os.sep, '/')
                    slug = f"{group_path}/{file[:-5]}"
                
                # Extract title automatically from HTML file (<title> or <h1>)
                title = file[:-5]
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        soup = BeautifulSoup(f.read(), 'html.parser')
                        if soup.title and soup.title.string:
                            title = soup.title.string.strip()
                        elif soup.h1 and soup.h1.string:
                            title = soup.h1.string.strip()
                except Exception:
                    pass

                tasks[slug] = {
                    "id": slug,
                    "title": title,
                    "group": group_path if group_path else "root",
                    "contentUrl": f"/api/content/{slug}",
                    "required": [],  # Can be configured or left empty for roots
                    "completed": False
                }
                
    # Automatically define simple sequential dependencies if none manually configured
    task_keys = list(tasks.keys())
    for i in range(1, len(task_keys)):
        group_tasks = [tasks[k] for k in task_keys if tasks[k]["group"] == tasks[task_keys[i]]["group"]]
        #add tasks of parent group to the list of tasks
        if tasks[task_keys[i]]["group"] != "root":
            parent_group = tasks[task_keys[i]]["group"].rsplit('/', 1)[0] if '/' in tasks[task_keys[i]]["group"] else "root"
            group_tasks += [tasks[k] for k in task_keys if tasks[k]["group"] == parent_group]
        
        group_tasks.sort(key=lambda x: x["id"])  # Sort by slug for consistent order
        if len(group_tasks) > 1:
            # Ensure tasks in the same group are sequentially dependent
            tasks[task_keys[i]]["required"] = [group_tasks[group_tasks.index(tasks[task_keys[i]]) - 1]["id"]]
        # By default, each task requires the immediately preceding task
        # tasks[task_keys[i]]["required"] = [task_keys[i-1]]

    return tasks

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    return jsonify(scan_teachings())

@app.route('/api/content/<path:subpath>', methods=['GET'])
def get_content(subpath):
    # Serve individual html content files from sub-folders securely
    return send_from_directory(TEACHINGS_DIR, f"{subpath}.html")

APP_HTML = "app.html"
@app.route('/')
def index():
    # Serve the front-end SPA file directly
    if os.path.exists(APP_HTML):
        with open(APP_HTML, 'r', encoding='utf-8') as f:
            return render_template_string(f.read())
    return f"Front-end '{APP_HTML}' not found.", 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
