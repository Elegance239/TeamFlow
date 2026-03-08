require 'rails_helper'

RSpec.describe TaskHistory, type: :model do
  let(:team)   { Team.create!(name: "Dev Team") }
  let(:lead)   { User.create!(name: "Lead", team: team, role: :team_lead) }
  let(:member) { User.create!(name: "Member", team: team, role: :team_member) }
  let(:task)   { Task.create!(due_date: Date.today + 5, team: team, created_by: lead.id, points: 1) }

  describe "validations" do
    it "is valid with user, task, and start_date" do
      history = TaskHistory.new(user: member, task: task, start_date: Date.today)
      expect(history).to be_valid
    end

    it "is invalid without a start_date, user or a task" do
      history = TaskHistory.new(user: member, task: task, start_date: nil)
      expect(history).not_to be_valid
      expect(history.errors[:start_date]).to be_present

      history = TaskHistory.new(user: nil, task: task, start_date: Date.today)
      expect(history).not_to be_valid

      history = TaskHistory.new(user: member, task: nil, start_date: Date.today)
      expect(history).not_to be_valid
    end
  end

  describe "append-only log behaviour" do
    it "allows multiple history entries for the same user on the same task" do
      TaskHistory.create!(user: member, task: task, start_date: Date.today - 7)
      duplicate = TaskHistory.new(user: member, task: task, start_date: Date.today)
      expect(duplicate).to be_valid
      expect { duplicate.save! }.to change { TaskHistory.count }.by(1)
    end

    it "allows different users to have histories on the same task" do
      lead2 = User.create!(name: "Lead2", team: team, role: :team_lead)
      TaskHistory.create!(user: member, task: task, start_date: Date.today - 3)
      history2 = TaskHistory.new(user: lead2, task: task, start_date: Date.today)
      expect(history2).to be_valid
    end
  end

  describe "associations" do
    it "belongs to a user" do
      history = TaskHistory.create!(user: member, task: task, start_date: Date.today)
      expect(history.user).to eq(member)
    end

    it "belongs to a task" do
      history = TaskHistory.create!(user: member, task: task, start_date: Date.today)
      expect(history.task).to eq(task)
    end

    it "is destroyed when the associated task is destroyed" do
      TaskHistory.create!(user: member, task: task, start_date: Date.today)
      expect { task.destroy }.to change { TaskHistory.count }.by(-1)
    end

    it "is destroyed when the associated user is destroyed" do
      other_member = User.create!(name: "Temp", team: team, role: :team_member)
      TaskHistory.create!(user: other_member, task: task, start_date: Date.today)
      expect { other_member.destroy }.to change { TaskHistory.count }.by(-1)
    end
  end
end
