require 'rails_helper'

RSpec.describe TaskStep, type: :model do
  let(:team) { Team.create!(name: "Dev Team") }
  let(:lead) { User.create!(name: "Lead", team: team, role: :team_lead) }
  let(:task) { Task.create!(due_date: Date.today + 5, team: team, created_by: lead.id, points: 1) }
  let(:other_task) { Task.create!(due_date: Date.today + 5, team: team, created_by: lead.id, points: 1) }

  def valid_step(overrides = {})
    TaskStep.new({ task: task, step_num: 0, name: "Step One" }.merge(overrides))
  end

  describe "validations" do
    it "is valid with step_num, name, and task" do
      expect(valid_step).to be_valid
    end

    it "is invalid without a name" do
      step = valid_step(name: nil)
      expect(step).not_to be_valid
      expect(step.errors[:name]).to be_present
    end

    it "is invalid with a blank name" do
      step = valid_step(name: "")
      expect(step).not_to be_valid
    end

    it "is valid with a name of exactly 100 characters" do
      step = valid_step(name: "A" * 100)
      expect(step).to be_valid
    end

    it "is invalid with a name exceeding 100 characters" do
      step = valid_step(name: "A" * 101)
      expect(step).not_to be_valid
      expect(step.errors[:name]).to be_present
    end

    it "is invalid without a step_num" do
      step = valid_step(step_num: nil)
      expect(step).not_to be_valid
      expect(step.errors[:step_num]).to be_present
    end

    it "step_num 0 is valid" do
      expect(valid_step(step_num: 0)).to be_valid
    end

    it "step_num of a positive integer is valid" do
      expect(valid_step(step_num: 99)).to be_valid
    end

    it "is invalid with a negative step_num" do
      step = valid_step(step_num: -1)
      expect(step).not_to be_valid
      expect(step.errors[:step_num]).to be_present
    end

    it "is invalid with a float step_num" do
      step = valid_step(step_num: 1.5)
      expect(step).not_to be_valid
      expect(step.errors[:step_num]).to be_present
    end

    it "is valid without a due_date (optional)" do
      expect(valid_step(due_date: nil)).to be_valid
    end

    it "is valid without a description (optional)" do
      expect(valid_step(description: nil)).to be_valid
    end

    it "is invalid with a duplicate step_num in the same task" do
      valid_step(step_num: 0).save!
      duplicate = valid_step(step_num: 0)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:step_num]).to be_present
    end

    it "allows the same step_num in a different task" do
      valid_step(step_num: 0).save!
      step_in_other = TaskStep.new(task: other_task, step_num: 0, name: "Other Step")
      expect(step_in_other).to be_valid
    end
  end

  describe "immutability" do
    it "cannot be updated after creation" do
      step = valid_step
      step.save!
      expect(step.update(name: "Changed")).to be false
      expect(step.errors[:base]).to be_present
    end

    it "persists the original name after a failed update" do
      step = valid_step(name: "Original Name")
      step.save!
      step.update(name: "Changed Name")
      expect(step.reload.name).to eq("Original Name")
    end

    it "cannot update the due_date after creation" do
      step = valid_step(due_date: Date.today + 3)
      step.save!
      expect(step.update(due_date: Date.today + 10)).to be false
    end
  end

  describe "associations" do
    it "belongs to a task" do
      step = valid_step
      step.save!
      expect(step.task).to eq(task)
    end
  end
end
