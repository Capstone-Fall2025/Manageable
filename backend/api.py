from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from canvaAPI_utils import get_canvas_assignments
from category_task_scheduler import sort_tasks


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])



tasks = []  # List of manually added tasks by user
canvas_tasks = []  # List of tasks fetched from the Canvas API

# Example structure of a task:
# {
#     "id": 1,
#     "title": "Task Title",
#     "due_date": "2023-10-01T12:00:00",
#     "category": "Work"
# }

@app.route('/tasks', methods=['POST'])
def add_task():
    #Add a new manual task
    new_task = request.json
    new_task['id'] = len(tasks) + 1  # Assign a unique ID
    tasks.append(new_task)  # Add the task to the manual tasks list

    # Combine and sort tasks after adding the new task
    all_tasks = tasks + canvas_tasks
    sorted_tasks = sort_tasks(all_tasks)

    return jsonify({sorted_tasks}), 200



@app.route('/canvas', methods=['POST'])
def update_canvas_tasks():
    #Update Canvas tasks 
    global canvas_tasks
    canvas_tasks = request.json  # replace with fetched Canvas tasks

    # combine and sort tasks after updating Canvas tasks
    all_tasks = tasks + canvas_tasks
    sorted_tasks = sort_tasks(all_tasks)

    return jsonify({sorted_tasks}), 200


@app.route('/canvas', methods=['GET'])
def get_canvas_tasks():
    # Get all Canvas tasks
    return jsonify(canvas_tasks), 200



@app.route('/all', methods=['GET'])
def get_all_tasks():
    try:
        canvas_tasks = get_canvas_assignments()
        combined = tasks + canvas_tasks

        # filter out tasks that are past due 
        today = datetime.now()
        upcoming = []
        for t in combined:
            due_str = t.get("due_date")
            if not due_str:
                upcoming.append(t)  # keep undated tasks
                continue
            try:
                due = datetime.strptime(due_str[:10], "%Y-%m-%d")
                if due >= today:
                    upcoming.append(t)
            except Exception:
                pass

        sorted_tasks = sort_tasks(upcoming)
        ## for manually added tasks the date once added goes to a day earlier -- I am still looking into what is causing this ##
        for t in sorted_tasks:
            if isinstance(t.get("due_date"), datetime):
                t["due_date"] = t["due_date"].strftime("%Y-%m-%d")

        return jsonify(sorted_tasks), 200
    except Exception as e:
        print("Error combining tasks:", e)
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
