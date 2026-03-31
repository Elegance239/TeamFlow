require "rails_helper"

RSpec.describe TaskMailer, type: :mailer do
  describe "new_task" do
    let(:team) { create(:team) }
    let(:lead) { create(:user, :team_lead, team: team) }
    let(:user) { create(:user, :team_member, team: team) }
    let(:task) { create(:task, description: "Test new task", team: team, created_by: lead.id, assigned_user: user) }
    let(:mail) { TaskMailer.new_task(task) }

    it "renders the headers" do
      expect(mail.subject).to eq("New task assigned: #{task.description}")
      expect(mail.to).to eq([ user.email ])
      expect(mail.from).to eq([ lead.email ])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Hi")
    end
  end

  describe "deadline_reminder" do
    let(:team) { create(:team) }
    let(:lead) { create(:user, :team_lead, team: team) }
    let(:user) { create(:user, :team_member, team: team) }
    let(:task) { create(:task, description: "Test new reminder", team: team, created_by: lead.id, assigned_user: user) }
    let(:mail) { TaskMailer.deadline_reminder(task) }

    it "renders the headers" do
      expect(mail.subject).to eq("Reminder: #{task.description} is due tomorrow")
      expect(mail.to).to eq([ user.email ])
      expect(mail.from).to eq([ lead.email ])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Hi")
    end
  end
end
