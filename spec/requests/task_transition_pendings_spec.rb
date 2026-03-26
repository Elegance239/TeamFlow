require "rails_helper"

RSpec.describe "TaskTransitionPendings", type: :request do
  let(:team) { create(:team) }
  let(:lead) { create(:user, :team_lead, team: team, skills: "ruby") }
  let(:member) { create(:user, team: team, skills: "ruby") }

  def create_validated_task
    Task.create!(
      due_date: Date.today + 5,
      team: team,
      created_by: lead.id,
      points: 3,
      user_id: member.id,
      needs_validation: true,
      required_skills: "ruby"
    )
  end

  describe "POST /task_transition_pendings/:id/approve" do
    it "allows task creator to approve pending transitions" do
      task = create_validated_task
      task.request_progress!(requested_by: member)
      pending = task.task_transition_pendings.last

      sign_in lead
      post "/task_transition_pendings/#{pending.id}/approve"

      expect(response).to have_http_status(:ok)
      expect(pending.reload.status).to eq("approved")
      expect(task.reload.current_state).to eq(Task::COMPLETED)
      expect(task.completed_by_id).to eq(member.id)
    end

    it "forbids non-approvers" do
      task = create_validated_task
      task.request_progress!(requested_by: member)
      pending = task.task_transition_pendings.last
      outsider = create(:user, team: team)

      sign_in outsider
      post "/task_transition_pendings/#{pending.id}/approve"

      expect(response).to have_http_status(:forbidden)
      expect(pending.reload.status).to eq("pending")
    end
  end

  describe "POST /task_transition_pendings/:id/reject" do
    it "marks the transition as rejected" do
      task = create_validated_task
      task.request_progress!(requested_by: member)
      pending = task.task_transition_pendings.last

      sign_in lead
      post "/task_transition_pendings/#{pending.id}/reject"

      expect(response).to have_http_status(:ok)
      expect(pending.reload.status).to eq("rejected")
      expect(task.reload.current_state).to eq(Task::ASSIGNED)
    end
  end
end
