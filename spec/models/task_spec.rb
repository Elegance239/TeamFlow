require "rails_helper"

RSpec.describe Task, type: :model do
  let(:team) { create(:team, name: "Dev Team") }
  let(:lead) { create(:user, :team_lead, name: "Lead", team: team) }

  def valid_task(overrides = {})
    Task.new({
      title: "Test Task",
      due_date: Date.today + 1,
      team: team,
      created_by: lead.id,
      points: 1
    }.merge(overrides))
  end

  describe "validations" do
    it "is valid with a title, future due_date, team, and created_by" do
      expect(valid_task).to be_valid
    end

    it "is invalid without a title" do
      task = valid_task(title: nil)
      expect(task).not_to be_valid
      expect(task.errors[:title]).to be_present
    end

    it "is invalid without due_date" do
      task = valid_task(due_date: nil)
      expect(task).not_to be_valid
      expect(task.errors[:due_date]).to be_present
    end
  end

  describe "required skills" do
    let(:member) { create(:user, team: team, skills: "ruby,js") }

    it "normalizes required skills at creation" do
      task = valid_task(required_skills: " Ruby,JS,ruby ")
      task.save!

      expect(task.required_skills).to eq("ruby,js")
      expect(task.required_skills_list).to eq([ "ruby", "js" ])
    end

    it "allows an empty required skills list" do
      task = valid_task(required_skills: "")
      expect(task).to be_valid
    end

    it "prevents required skills from being edited after creation" do
      task = valid_task(required_skills: "ruby")
      task.save!

      expect(task.update(required_skills: "js")).to be(false)
      expect(task.errors[:required_skills]).to include("cannot be changed after task creation")
    end

    it "enforces assignee skills on assignment" do
      task = valid_task(required_skills: "ruby,go")
      task.save!

      expect(task.update(user_id: member.id)).to be(false)
      expect(task.errors[:assigned_user]).to be_present
    end
  end

  describe "workflow states" do
    let(:member) { create(:user, team: team, skills: "ruby") }

    it "defaults all_states to base workflow" do
      task = valid_task
      task.save!

      expect(task.all_states).to eq("UNASSIGNED,ASSIGNED,COMPLETED")
      expect(task.current_state).to eq(Task::UNASSIGNED)
    end

    it "normalizes optional states to the predetermined order" do
      task = valid_task(user_id: member.id, all_states: "testing,development")
      task.save!

      expect(task.all_states).to eq("UNASSIGNED,ASSIGNED,DEVELOPMENT,TESTING,COMPLETED")
      expect(task.current_state).to eq(Task::ASSIGNED)
    end

    it "prevents all_states from being edited after creation" do
      task = valid_task(all_states: "DEVELOPMENT")
      task.save!

      expect(task.update(all_states: "UNASSIGNED,ASSIGNED,COMPLETED")).to be(false)
      expect(task.errors[:all_states]).to include("cannot be changed after task creation")
    end

    it "transitions progressively through optional states" do
      task = valid_task(user_id: member.id, all_states: "DEVELOPMENT,TESTING,PRODUCTION")
      task.save!

      expect(task.request_progress!(requested_by: member)).to eq(:applied)
      expect(task.reload.current_state).to eq(Task::DEVELOPMENT)

      expect(task.request_progress!(requested_by: member)).to eq(:applied)
      expect(task.reload.current_state).to eq(Task::TESTING)

      expect(task.request_progress!(requested_by: member)).to eq(:applied)
      expect(task.reload.current_state).to eq(Task::PRODUCTION)

      expect(task.request_progress!(requested_by: member)).to eq(:applied)
      expect(task.reload.current_state).to eq(Task::COMPLETED)
      expect(task.completed_by).to eq(member)
    end

    it "creates pending transitions when validation is required" do
      task = valid_task(user_id: member.id, needs_validation: true)
      task.save!

      expect(task.request_progress!(requested_by: member)).to eq(:pending)
      pending = task.task_transition_pendings.last
      expect(pending.status).to eq("pending")
      expect(task.reload.current_state).to eq(Task::ASSIGNED)

      pending.approve!(actor: lead)
      expect(task.reload.current_state).to eq(Task::COMPLETED)
      expect(task.completed_by).to eq(member)
    end
  end

  describe ".with_score_for_user" do
    let(:member) { create(:user, team: team, skills: "ruby") }

    it "returns per-task score for the selected user" do
      completed = valid_task(user_id: member.id)
      completed.save!
      completed.update!(current_state: Task::COMPLETED, completed_by_id: member.id)

      incomplete = valid_task
      incomplete.save!

      rows = Task.where(id: [ completed.id, incomplete.id ]).with_score_for_user(member.id)
      score_map = rows.index_by(&:id).transform_values { |row| row.attributes["user_score"].to_i }

      expect(score_map[completed.id]).to eq(completed.points)
      expect(score_map[incomplete.id]).to eq(0)
    end
  end

  describe "assignment names" do
    let(:member) { create(:user, name: "Alice", team: team, skills: "ruby") }

    it "returns the name of the creator" do
      task = valid_task(creator: lead)
      expect(task.creator_name).to eq("Lead")
    end

    it "returns the name of the assignee when present" do
      task = valid_task(assigned_user: member)
      expect(task.assignee_name).to eq("Alice")
    end

    it "returns 'Unassigned' when no user is assigned" do
      task = valid_task(assigned_user: nil)
      expect(task.assignee_name).to eq("Unassigned")
    end
  end
end
