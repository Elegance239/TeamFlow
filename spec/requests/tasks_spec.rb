require "rails_helper"

RSpec.describe "Tasks", type: :request do
  let(:team) { Team.create!(name: "Dev Team") }
  let(:lead) { User.create!(name: "Lead", email: "lead@example.com", password: "password", password_confirmation: "password", team: team, role: :team_lead) }
  let(:member) { User.create!(name: "Member", email: "member@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member) }
  let(:other_team) { Team.create!(name: "Other Team") }
  let(:other_lead) { User.create!(name: "Other Lead", email: "other_lead@example.com", password: "password", password_confirmation: "password", team: other_team, role: :team_lead) }

  def create_task(overrides = {})
    Task.create!({ title: "Task Title", due_date: Date.today + 7, team: team, created_by: lead.id, points: 1 }.merge(overrides))
  end

  describe "POST /tasks" do
    it "creates a task and auto-sets team_id and created_by" do
      sign_in lead

      post "/tasks", params: {
        title: "Fix the bug",
        description: "The login button is broken",
        due_date: (Date.today + 7).iso8601,
        points: 5
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["team_id"]).to eq(team.id)
      expect(json["created_by"]).to eq(lead.id)
      expect(json["title"]).to eq("Fix the bug")
      expect(json["description"]).to eq("The login button is broken")
      expect(json["current_state"]).to eq(Task::UNASSIGNED)
      expect(json["all_states"]).to eq("UNASSIGNED,ASSIGNED,COMPLETED")
    end

    it "allows opting into additional workflow states" do
      sign_in lead

      post "/tasks", params: {
        title: "Optional Workflow Task",
        due_date: (Date.today + 10).iso8601,
        points: 3,
        all_states: "TESTING,DEVELOPMENT"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["all_states"]).to eq("UNASSIGNED,ASSIGNED,DEVELOPMENT,TESTING,COMPLETED")
    end

    it "allows required_skills and needs_validation on creation" do
      sign_in lead

      post "/tasks", params: {
        title: "Validation Task",
        due_date: (Date.today + 7).iso8601,
        points: 2,
        required_skills: " Ruby, SQL ",
        needs_validation: true
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["required_skills"]).to eq("ruby,sql")
      expect(json["needs_validation"]).to eq(true)
    end

    it "allows team lead to assign a new task to a team member on creation" do
      skilled_member = User.create!(name: "Skilled", email: "skilled@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member, skills: "ruby")
      sign_in lead

      post "/tasks", params: {
        title: "Assigned Task",
        due_date: (Date.today + 7).iso8601,
        points: 2,
        user_id: skilled_member.id,
        required_skills: "ruby"
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["user_id"]).to eq(skilled_member.id)
      expect(json["current_state"]).to eq(Task::ASSIGNED)
      expect(TaskHistory.where(user_id: skilled_member.id, task_id: json["id"]).count).to eq(1)
    end

    it "forbids a team member from creating a task" do
      sign_in member

      post "/tasks", params: { due_date: (Date.today + 7).iso8601, points: 1 }

      expect(response).to have_http_status(:forbidden)
    end

    it "rejects past due_date" do
      sign_in lead

      post "/tasks", params: { due_date: (Date.today - 1).iso8601, points: 1 }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /tasks" do
    it "returns all tasks for the requester's team" do
      sign_in member
      t1 = create_task(title: "Task 1", description: "Task 1")
      t2 = create_task(title: "Task 2", description: "Task 2")
      create_task_in_other = Task.create!(title: "Other Team Task", due_date: Date.today + 5, team: other_team, created_by: other_lead.id, points: 1)

      get "/tasks"
      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)
      ids = data.map { |t| t["id"] }
      expect(ids).to include(t1.id, t2.id)
      expect(ids).not_to include(create_task_in_other.id)

      t1_json = data.find { |t| t["id"] == t1.id }
      expect(t1_json["title"]).to eq("Task 1")
    end
  end

  describe "GET /tasks/:id" do
    it "returns the task for a team member" do
      sign_in member
      task = create_task

      get "/tasks/#{task.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["id"]).to eq(task.id)
      expect(json["title"]).to eq(task.title)
      expect(json["all_states"]).to be_present
    end

    it "forbids users from another team" do
      sign_in other_lead
      task = create_task

      get "/tasks/#{task.id}"

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /tasks/:id" do
    it "allows creating team lead to update description and points" do
      sign_in lead
      task = create_task(description: "Old", points: 1)

      patch "/tasks/#{task.id}", params: { title: "New Title", description: "New", points: 3 }

      expect(response).to have_http_status(:ok)
      task.reload
      expect(task.title).to eq("New Title")
      expect(task.description).to eq("New")
      expect(task.points).to eq(3)
    end

    it "forbids non-creator from updating" do
      other_lead_same_team = User.create!(name: "Lead 2", email: "lead2@example.com", password: "password", password_confirmation: "password", team: team, role: :team_lead)
      task = create_task(description: "Old")
      sign_in other_lead_same_team

      patch "/tasks/#{task.id}", params: { description: "New" }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /tasks/:id" do
    it "allows creating team lead to delete task" do
      sign_in lead
      task = create_task

      delete "/tasks/#{task.id}"

      expect(response).to have_http_status(:no_content)
      expect(Task.find_by(id: task.id)).to be_nil
    end

    it "forbids non-creator from deleting" do
      task = create_task
      sign_in member

      delete "/tasks/#{task.id}"

      expect(response).to have_http_status(:forbidden)
      expect(Task.find_by(id: task.id)).to be_present
    end
  end

  describe "POST /tasks/:id/assign" do
    it "assigns an unassigned task to the requesting user" do
      sign_in member
      task = create_task

      post "/tasks/#{task.id}/assign"

      expect(response).to have_http_status(:ok)
      expect(task.reload.user_id).to eq(member.id)
      expect(task.current_state).to eq(Task::ASSIGNED)
    end

    it "allows a team lead to assign an existing task to a team member" do
      skilled_member = User.create!(name: "Skilled", email: "skilled2@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member, skills: "ruby")
      task = create_task(required_skills: "ruby")
      sign_in lead

      post "/tasks/#{task.id}/assign", params: { user_id: skilled_member.id }

      expect(response).to have_http_status(:ok)
      expect(task.reload.user_id).to eq(skilled_member.id)
      expect(task.current_state).to eq(Task::ASSIGNED)
    end

    it "forbids a team member from assigning a task to another user" do
      other_member = User.create!(name: "Other", email: "other@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member)
      task = create_task
      sign_in member

      post "/tasks/#{task.id}/assign", params: { user_id: other_member.id }

      expect(response).to have_http_status(:forbidden)
      expect(task.reload.user_id).to be_nil
    end
  end

  describe "POST /tasks/:id/progress" do
    it "progresses through optional states in order" do
      skilled_member = User.create!(name: "Skilled3", email: "skilled3@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member, skills: "ruby")
      sign_in lead
      post "/tasks", params: {
        title: "Progress Task",
        due_date: (Date.today + 6).iso8601,
        points: 2,
        user_id: skilled_member.id,
        required_skills: "ruby",
        all_states: "DEVELOPMENT,TESTING,PRODUCTION"
      }
      task_id = JSON.parse(response.body)["id"]

      sign_out lead
      sign_in skilled_member

      post "/tasks/#{task_id}/progress"
      expect(response).to have_http_status(:ok)
      expect(Task.find(task_id).current_state).to eq(Task::DEVELOPMENT)

      post "/tasks/#{task_id}/progress"
      expect(Task.find(task_id).current_state).to eq(Task::TESTING)

      post "/tasks/#{task_id}/progress"
      expect(Task.find(task_id).current_state).to eq(Task::PRODUCTION)

      post "/tasks/#{task_id}/progress"
      expect(Task.find(task_id).current_state).to eq(Task::COMPLETED)
    end

    it "creates pending transition when task needs validation" do
      skilled_member = User.create!(name: "Skilled4", email: "skilled4@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member, skills: "ruby")
      sign_in lead
      post "/tasks", params: {
        title: "Validated Progress Task",
        due_date: (Date.today + 6).iso8601,
        points: 2,
        user_id: skilled_member.id,
        required_skills: "ruby",
        needs_validation: true
      }
      task_id = JSON.parse(response.body)["id"]

      sign_out lead
      sign_in skilled_member
      post "/tasks/#{task_id}/progress"

      expect(response).to have_http_status(:accepted)
      expect(Task.find(task_id).current_state).to eq(Task::ASSIGNED)
      expect(TaskTransitionPending.where(task_id: task_id, status: "pending").count).to eq(1)
    end
  end

  describe "DELETE /tasks/:id/unassign" do
    it "allows assigned user to unassign" do
      task = create_task(user_id: member.id, current_state: Task::ASSIGNED)
      sign_in member

      delete "/tasks/#{task.id}/unassign"

      expect(response).to have_http_status(:no_content)
      expect(task.reload.user_id).to be_nil
      expect(task.current_state).to eq(Task::UNASSIGNED)
    end

    it "forbids non-assigned user" do
      task = create_task(user_id: member.id, current_state: Task::ASSIGNED)
      other_member = User.create!(name: "Other Member", email: "other_member@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member)
      sign_in other_member

      delete "/tasks/#{task.id}/unassign"

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "GET /tasks/scores" do
    it "returns per-task score for the selected user" do
      skilled_member = User.create!(name: "Skilled5", email: "skilled5@example.com", password: "password", password_confirmation: "password", team: team, role: :team_member, skills: "ruby")
      t1 = create_task(user_id: skilled_member.id, current_state: Task::COMPLETED, completed_by_id: skilled_member.id, points: 7)
      t2 = create_task(points: 3)

      sign_in lead
      get "/tasks/scores", params: { user_id: skilled_member.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      row1 = json.find { |row| row["task_id"] == t1.id }
      row2 = json.find { |row| row["task_id"] == t2.id }

      expect(row1["user_score"]).to eq(7)
      expect(row1["title"]).to eq(t1.title)
      expect(row2["user_score"]).to eq(0)
      expect(row2["title"]).to eq(t2.title)
    end

    it "forbids access across teams" do
      outsider = User.create!(name: "Outsider", email: "outsider_scores@example.com", password: "password", password_confirmation: "password", team: other_team, role: :team_member)
      sign_in outsider

      get "/tasks/scores", params: { user_id: member.id }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
