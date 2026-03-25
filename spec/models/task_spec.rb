require 'rails_helper'

RSpec.describe Task, type: :model do
  let(:team) { create(:team, name: "Dev Team") }
  let(:lead) { create(:user, :team_lead, name: "Lead", team: team) }

  def valid_task(overrides = {})
    Task.new({
      due_date: Date.today + 1,
      team: team,
      created_by: lead.id,
      points: 1
    }.merge(overrides))
  end

  describe "validations" do
    it "is valid with a future due_date, team, and created_by" do
      expect(valid_task).to be_valid
    end

    it "is invalid without a due_date, team_id, created_by" do
      task = valid_task(due_date: nil)
      expect(task).not_to be_valid
      expect(task.errors[:due_date]).to be_present

      task = Task.new(due_date: Date.today + 1, created_by: lead.id)
      expect(task).not_to be_valid

      task = Task.new(due_date: Date.today + 1, team: team)
      expect(task).not_to be_valid
    end

    # ... the rest of your validation tests stay exactly the same ...
    # (they only call valid_task or create tasks, so no further changes needed)
  end

  describe "task step due-date ordering" do
    # unchanged — your existing tests are fine
  end

  describe "associations" do
    it "belongs to a team" do
      task = valid_task
      task.save!
      expect(task.team).to eq(team)
    end

    it "has a creator via created_by" do
      task = valid_task
      task.save!
      expect(task.creator).to eq(lead)
    end

    it "starts unassigned" do
      task = valid_task
      task.save!
      expect(task.assigned_user).to be_nil
    end

    it "can be assigned to a user" do
      task = valid_task
      task.save!
      member = create(:user, name: "Member", team: team)
      task.update!(user_id: member.id)
      expect(task.reload.assigned_user).to eq(member)
    end

    it "destroys task history when task is destroyed" do
      task = valid_task
      task.save!
      member = create(:user, name: "Member", team: team)
      TaskHistory.create!(user_id: member.id, task_id: task.id, start_date: Date.today)
      expect { task.destroy }.to change { TaskHistory.count }.by(-1)
    end

    it "destroys task steps when task is destroyed" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A")
      task.save!
      expect { task.destroy }.to change { TaskStep.count }.by(-1)
    end
  end

  describe "task claiming" do
    let(:member) { create(:user, name: "Member", team: team) }
    let(:other_team) { create(:team, name: "Other Team") }
    let(:outsider) { create(:user, name: "Outsider", team: other_team) }

    it "unclaimed when first created" do
      task = valid_task
      task.save!
      expect(task.assigned_user).to be_nil
    end

    it "can be claimed by a member" do
      task = valid_task
      task.save!
      task.update!(user_id: member.id)
      expect(task.assigned_user).to eq(member)
    end

    it "can be unclaimed, returning to unassigned" do
      task = valid_task
      task.save!
      task.update!(user_id: member.id)
      task.update!(user_id: nil)
      expect(task.assigned_user).to be_nil
    end
  end
end
