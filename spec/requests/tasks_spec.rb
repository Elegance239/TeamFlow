require 'rails_helper'

RSpec.describe "Tasks", type: :request do
  let(:team)    { Team.create!(name: "Dev Team") }
  let(:lead)    { User.create!(name: "Lead",    team: team, role: :team_lead) }
  let(:member)  { User.create!(name: "Member",  team: team, role: :team_member) }
  let(:other_team) { Team.create!(name: "Other Team") }
  let(:other_lead) { User.create!(name: "Other Lead", team: other_team, role: :team_lead) }

  def create_task(overrides = {})
    Task.create!({ due_date: Date.today + 7, team: team, created_by: lead.id, points: 1 }.merge(overrides))
  end

  describe "POST /tasks" do
    it "creates a task and auto-sets team_id and created_by" do
      post "/tasks", params: {
        user_id:     lead.id,
        description: "Fix the bug",
        due_date:    (Date.today + 7).iso8601,
        points:      5
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["team_id"]).to eq(team.id)
      expect(json["created_by"]).to eq(lead.id)
      expect(json["description"]).to eq("Fix the bug")
      expect(json["points"]).to eq(5)
      expect(json["user_id"]).to be_nil
    end

    it "creates a task with nested task_steps" do
      post "/tasks", params: {
        user_id:  lead.id,
        due_date: (Date.today + 10).iso8601,
        points:   3,
        task_steps_attributes: [
          { step_num: 0, name: "Design", due_date: (Date.today + 4).iso8601 },
          { step_num: 1, name: "Implement", due_date: (Date.today + 8).iso8601 }
        ]
      }

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["task_steps"].length).to eq(2)
      expect(json["task_steps"].map { |s| s["step_num"] }).to contain_exactly(0, 1)
    end

    it "forbids a team_member from creating a task" do
      post "/tasks", params: { user_id: member.id, due_date: (Date.today + 5).iso8601 }
      expect(response).to have_http_status(:forbidden)
    end

    it "forbids a team_lead without a team from creating a task" do
      teamless_lead = User.create!(name: "No Team Lead", role: :team_lead)
      post "/tasks", params: { user_id: teamless_lead.id, due_date: (Date.today + 5).iso8601 }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects a task with a past due_date" do
      post "/tasks", params: { user_id: lead.id, due_date: (Date.today - 1).iso8601 }
      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end

    it "rejects a task with today-1 as due_date (boundary check)" do
      post "/tasks", params: { user_id: lead.id, due_date: (Date.today - 1).iso8601 }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "accepts a task with today as the due_date (boundary)" do
      post "/tasks", params: { user_id: lead.id, due_date: Date.today.iso8601, points: 1 }
      expect(response).to have_http_status(:created)
    end

    it "rejects steps with descending due_dates" do
      post "/tasks", params: {
        user_id:  lead.id,
        due_date: (Date.today + 10).iso8601,
        task_steps_attributes: [
          { step_num: 0, name: "Later Step",   due_date: (Date.today + 8).iso8601 },
          { step_num: 1, name: "Earlier Step", due_date: (Date.today + 3).iso8601 }
        ]
      }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects a step with a negative step_num" do
      post "/tasks", params: {
        user_id:  lead.id,
        due_date: (Date.today + 5).iso8601,
        task_steps_attributes: [ { step_num: -1, name: "Bad Step" } ]
      }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects steps with duplicate step_nums" do
      post "/tasks", params: {
        user_id:  lead.id,
        due_date: (Date.today + 5).iso8601,
        task_steps_attributes: [
          { step_num: 0, name: "Step A" },
          { step_num: 0, name: "Step B" }
        ]
      }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "accepts steps where intermediate steps have no due_date" do
      post "/tasks", params: {
        user_id:  lead.id,
        due_date: (Date.today + 10).iso8601,
        points:   2,
        task_steps_attributes: [
          { step_num: 0, name: "Step A", due_date: (Date.today + 3).iso8601 },
          { step_num: 1, name: "Step B" },
          { step_num: 2, name: "Step C", due_date: (Date.today + 9).iso8601 }
        ]
      }
      expect(response).to have_http_status(:created)
    end

    it "ignores attempts to manually set team_id or created_by" do
      other_team = Team.create!(name: "Other")
      post "/tasks", params: {
        user_id:    lead.id,
        due_date:   (Date.today + 5).iso8601,
        points:     1,
        team_id:    other_team.id,
        created_by: 9999
      }
      json = JSON.parse(response.body)
      expect(json["team_id"]).to eq(team.id)
      expect(json["created_by"]).to eq(lead.id)
    end
  end

  describe "GET /tasks" do
    it "returns all tasks for the requester's team" do
      t1 = create_task(description: "Task 1")
      t2 = create_task(description: "Task 2")
      create_task_in_other = Task.create!(due_date: Date.today + 5, team: other_team, created_by: other_lead.id, points: 1)

      get "/tasks", params: { user_id: member.id }
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body).map { |t| t["id"] }
      expect(ids).to include(t1.id, t2.id)
      expect(ids).not_to include(create_task_in_other.id)
    end

    it "returns empty array when team has no tasks" do
      get "/tasks", params: { user_id: member.id }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq([])
    end

    it "returns 422 for a user not in any team" do
      guest = User.create!(name: "Guest")
      get "/tasks", params: { user_id: guest.id }
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /tasks/:id" do
    it "returns the task with its steps for a team member" do
      task = create_task
      TaskStep.create!(task: task, step_num: 0, name: "Step A")

      get "/tasks/#{task.id}", params: { user_id: member.id }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["id"]).to eq(task.id)
      expect(json["task_steps"].length).to eq(1)
    end

    it "forbids a user from another team from viewing the task" do
      task = create_task
      get "/tasks/#{task.id}", params: { user_id: other_lead.id }
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /tasks/:id" do
    it "allows the creating team_lead to update description and points" do
      task = create_task(description: "Old", points: 1)

      patch "/tasks/#{task.id}", params: { user_id: lead.id, description: "New", points: 20 }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["description"]).to eq("New")
      expect(json["points"]).to eq(20)
    end

    it "forbids a team_member from updating a task" do
      task = create_task
      patch "/tasks/#{task.id}", params: { user_id: member.id, description: "Hacked" }
      expect(response).to have_http_status(:forbidden)
    end

    it "forbids another team_lead in the same team from updating" do
      second_lead = User.create!(name: "Lead2", team: team, role: :team_lead)
      task = create_task
      patch "/tasks/#{task.id}", params: { user_id: second_lead.id, description: "Sneaky" }
      expect(response).to have_http_status(:forbidden)
    end

    it "forbids a team_lead from a different team from updating" do
      task = create_task
      patch "/tasks/#{task.id}", params: { user_id: other_lead.id, description: "Hacked" }
      expect(response).to have_http_status(:forbidden)
    end

    it "silently ignores attempts to change due_date via update" do
      task     = create_task(due_date: Date.today + 10)
      old_date = task.due_date
      patch "/tasks/#{task.id}", params: { user_id: lead.id, due_date: (Date.today + 99).iso8601 }
      expect(task.reload.due_date).to eq(old_date)
    end

    it "rejects non-integer points" do
      task = create_task
      patch "/tasks/#{task.id}", params: { user_id: lead.id, points: "not_a_number" }
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /tasks/:id" do
    it "allows the creating team_lead to destroy the task" do
      task = create_task
      delete "/tasks/#{task.id}", params: { user_id: lead.id }
      expect(response).to have_http_status(:no_content)
      expect(Task.find_by(id: task.id)).to be_nil
    end

    it "forbids a team_member from destroying a task" do
      task = create_task
      delete "/tasks/#{task.id}", params: { user_id: member.id }
      expect(response).to have_http_status(:forbidden)
      expect(Task.find_by(id: task.id)).not_to be_nil
    end

    it "forbids another team_lead from destroying the task" do
      second_lead = User.create!(name: "Lead2", team: team, role: :team_lead)
      task = create_task
      delete "/tasks/#{task.id}", params: { user_id: second_lead.id }
      expect(response).to have_http_status(:forbidden)
    end

    it "destroys task even after it has been assigned to a user" do
      task   = create_task
      member # ensure created
      task.update!(user_id: member.id)

      delete "/tasks/#{task.id}", params: { user_id: lead.id }
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /tasks/:id/assign" do
    it "assigns an unassigned task to the requesting user" do
      task = create_task

      post "/tasks/#{task.id}/assign", params: { user_id: member.id }

      expect(response).to have_http_status(:ok)
      expect(task.reload.user_id).to eq(member.id)
    end

    it "creates a TaskHistory entry when a user takes a task" do
      task = create_task
      expect {
        post "/tasks/#{task.id}/assign", params: { user_id: member.id }
      }.to change { TaskHistory.count }.by(1)

      history = TaskHistory.last
      expect(history.user_id).to eq(member.id)
      expect(history.task_id).to eq(task.id)
      expect(history.start_date).to eq(Date.today)
    end

    it "rejects assigning an already-assigned task" do
      task = create_task
      task.update!(user_id: member.id)
      other_member = User.create!(name: "Member2", team: team, role: :team_member)

      post "/tasks/#{task.id}/assign", params: { user_id: other_member.id }
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "forbids assigning a task from a different team" do
      task = create_task  # belongs to `team`
      post "/tasks/#{task.id}/assign", params: { user_id: other_lead.id }
      expect(response).to have_http_status(:forbidden)
    end

    it "records a second TaskHistory entry when the same user re-takes a task" do
      task = create_task
      post "/tasks/#{task.id}/assign", params: { user_id: member.id }
      delete "/tasks/#{task.id}/unassign", params: { user_id: member.id }  # give up first

      expect {
        post "/tasks/#{task.id}/assign", params: { user_id: member.id }
      }.to change { TaskHistory.count }.by(1)

      expect(TaskHistory.where(user_id: member.id, task_id: task.id).count).to eq(2)
    end
  end

  describe "DELETE /tasks/:id/unassign" do
    it "allows the assigned user to give up a task" do
      task = create_task
      task.update!(user_id: member.id)

      delete "/tasks/#{task.id}/unassign", params: { user_id: member.id }

      expect(response).to have_http_status(:no_content)
      expect(task.reload.user_id).to be_nil
    end

    it "forbids a non-assigned user from unassigning" do
      task = create_task
      task.update!(user_id: member.id)
      other_member = User.create!(name: "Other", team: team, role: :team_member)

      delete "/tasks/#{task.id}/unassign", params: { user_id: other_member.id }
      expect(response).to have_http_status(:forbidden)
    end

    it "forbids unassigning from a task that has no assigned user" do
      task = create_task  # user_id is nil

      delete "/tasks/#{task.id}/unassign", params: { user_id: member.id }
      expect(response).to have_http_status(:forbidden)
    end

    it "does not add a TaskHistory entry on unassign" do
      task = create_task
      task.update!(user_id: member.id)
      expect {
        delete "/tasks/#{task.id}/unassign", params: { user_id: member.id }
      }.not_to change { TaskHistory.count }
    end
  end

  describe "GET /tasks/:task_id/task_steps" do
    it "returns steps ordered by step_num" do
      task = create_task
      TaskStep.create!(task: task, step_num: 1, name: "Second")
      TaskStep.create!(task: task, step_num: 0, name: "First")

      get "/tasks/#{task.id}/task_steps"

      expect(response).to have_http_status(:ok)
      nums = JSON.parse(response.body).map { |s| s["step_num"] }
      expect(nums).to eq([ 0, 1 ])
    end
  end

  describe "GET /tasks/:task_id/task_steps/:id" do
    it "returns the step matching the step_num" do
      task = create_task
      TaskStep.create!(task: task, step_num: 2, name: "Step Two")

      get "/tasks/#{task.id}/task_steps/2"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("Step Two")
    end

    it "returns 404 for a non-existent step_num" do
      task = create_task
      get "/tasks/#{task.id}/task_steps/99"
      expect(response).to have_http_status(:not_found)
    end
  end
end
