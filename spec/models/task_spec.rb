require 'rails_helper'

RSpec.describe Task, type: :model do
  let(:team) { Team.create!(name: "Dev Team") }
  let(:lead) { User.create!(name: "Lead", team: team, role: :team_lead) }

  def valid_task(overrides = {})
    Task.new({ due_date: Date.today + 1, team: team, created_by: lead.id, points: 1 }.merge(overrides))
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
      # created_by is a FK, AR checks the association
      expect(task).not_to be_valid
    end

    it "is invalid with a due_date in the past" do
      task = valid_task(due_date: Date.today - 1)
      expect(task).not_to be_valid
      expect(task.errors[:due_date]).to be_present
    end

    it "is valid with due_date exactly today" do
      expect(valid_task(due_date: Date.today)).to be_valid
    end

    it "does not re-check past due_date on update (task may age)" do
      task = valid_task(due_date: Date.today)
      task.save!
      # Simulate time passing: manually set due_date in the past and update another field
      task.update_column(:due_date, Date.today - 30)
      expect(task.update(description: "Updated description")).to be true
    end

    it "is invalid without points" do
      task = valid_task(points: nil)
      expect(task).not_to be_valid
      expect(task.errors[:points]).to be_present
    end

    it "is valid with integer points" do
      expect(valid_task(points: 10)).to be_valid
    end

    it "is invalid with non-integer points" do
      task = valid_task(points: 3.5)
      expect(task).not_to be_valid
      expect(task.errors[:points]).to be_present
    end

    it "is invalid with zero points" do
      task = valid_task(points: 0)
      expect(task).not_to be_valid
      expect(task.errors[:points]).to be_present
    end

    it "is invalid with negative points" do
      task = valid_task(points: -5)
      expect(task).not_to be_valid
      expect(task.errors[:points]).to be_present
    end

    it "allows nil description" do
      expect(valid_task(description: nil)).to be_valid
    end
  end

  describe "task step due-date ordering" do
    it "is valid when all steps have ascending due_dates" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: Date.today + 1)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: Date.today + 2)
      expect(task).to be_valid
    end

    it "is valid when steps have equal due_dates" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: Date.today + 1)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: Date.today + 1)
      expect(task).to be_valid
    end

    it "is invalid when a higher step_num step has an earlier due_date" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: Date.today + 5)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: Date.today + 2)
      expect(task).not_to be_valid
      expect(task.errors[:task_steps]).to be_present
    end

    it "skips ordering check for steps without due_dates" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: nil)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: nil)
      expect(task).to be_valid
    end

    it "catches out-of-order dates even when a middle step has no due_date" do
      # step 0: Mar+10, step 1: no date, step 2: Mar+5 → invalid (step 2 < step 0)
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: Date.today + 10)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: nil)
      task.task_steps.build(step_num: 2, name: "Step C", due_date: Date.today + 5)
      expect(task).not_to be_valid
      expect(task.errors[:task_steps]).to be_present
    end

    it "is valid when some steps have due_dates and a middle one does not" do
      task = valid_task
      task.task_steps.build(step_num: 0, name: "Step A", due_date: Date.today + 5)
      task.task_steps.build(step_num: 1, name: "Step B", due_date: nil)
      task.task_steps.build(step_num: 2, name: "Step C", due_date: Date.today + 10)
      expect(task).to be_valid
    end

    it "is valid with no steps at all" do
      expect(valid_task).to be_valid
    end
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
      member = User.create!(name: "Member", team: team, role: :team_member)
      task.update!(user_id: member.id)
      expect(task.reload.assigned_user).to eq(member)
    end

    it "destroys task history when task is destroyed" do
      task = valid_task
      task.save!
      member = User.create!(name: "Member", team: team, role: :team_member)
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
    let(:member) { User.create!(name: "Member", team: team, role: :team_member) }
    let(:other_team) { Team.create!(name: "Other Team") }
    let(:outsider) { User.create! name: "Outsider", team: other_team, role: :team_member }

    it "uncliamed when first created" do
      task= valid_task
      task.save!
      expect(task.assigned_user).to be_nil
    end

    it "can be claimed by a member" do
      task= valid_task
      task.save!
      task.update!(user_id: member.id)
      expect(task.assigned_user).to eq(member)
    end

    it "can be unclaimed, returning to unassigned" do
      task=valid_task
      task.save!
      task.update!(user_id: member.id)
      task.update!(user_id: nil)
      expect(task.assigned_user).to be_nil
    end
  end
end
