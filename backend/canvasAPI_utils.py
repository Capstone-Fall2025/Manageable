import requests
import json

# Replace this with your own Canvas API access token
ACCESS_TOKEN = ""

# Canvas course ID - Ypi can find it within the canvas url for the course
COURSE_ID = "73977"

BASE_URL = "https://american.instructure.com/api/v1"

# Standard request headers with authorization - From Canvas API 
HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

def get_assignment_groups():
    # Fetch Canvas assignment groups AND their weights
    url = f"{BASE_URL}/courses/{COURSE_ID}/assignment_groups"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error fetching assignment groups: {response.status_code}")
        return {}
    groups = response.json()
    # Map group_id -> group_weight
    return {g["id"]: g.get("group_weight", 0) for g in groups}
def get_canvas_assignments():
    #fetch Canvas assignments and attach their group weights
    try:
        groups = get_assignment_groups()
        url = f"{BASE_URL}/courses/{COURSE_ID}/assignments"
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error fetching Canvas assignments: {response.status_code}")
            return []

        data = response.json()
        assignments = []

        for a in data:
            # Extract and format due date
            due_date = a.get("due_at")
            if due_date:
                due_date = due_date[:10]  # Format: YYYY-MM-DD

            assignments.append({
                "id": a.get("id"),
                "title": a.get("name"),
                "description": a.get("description"),
                "due_date": due_date,
                "category": "Assignments",  # Important for sorting
                "priority": 1,              # Giving all canvas assignments a priority of 1 for now #
                "group_weight": groups.get(a.get("assignment_group_id"), 0),
                "html_url": a.get("html_url"),
            })

        return assignments

    except Exception as e:
        print("Error fetching Canvas data:", e)
        return []
    



'''' 
access_token = "" 


headers = { "Authorization": f"Bearer {access_token}"
           }
canvasBaseUrl = "https://american.instructure.com/api/v1/courses/73977/assignment_groups" #gets assignment groups
#canvasBaseUrl = "https://american.instructure.com/api/v1/courses/73977/grades" #gets course information on assignments
r = requests.get(canvasBaseUrl, headers=headers)
print(r.status_code)

assignments = r.json()
print(json.dumps(assignments, indent=2)) 

# Save to file
output_filename = "output_weighted_groups.json"
with open(output_filename, "w") as json_file:
    json.dump(assignments, json_file, indent=2)

print(f"Data saved to {output_filename}")'''


#what do i need: description, due_at


#make an assignmnet request
#response = requests.get(canvasBaseUrl, headers=headers)
#assignmentsInfo = response.json()
#print(assignmentsInfo)


#/api/v1/courses/:course_id/assignment_groups/:assignment_group_id/assignments
#Note that asking any other user to manually generate a token and enter it into your application
#problme: we need the schools permissiojn

#canvasBaseUrl = "https://american.instructure.com/api/v1/courses/73977/assignments"
#ethical legal course id: 73977
#HTTP status cods: request worked, token was ccepted
