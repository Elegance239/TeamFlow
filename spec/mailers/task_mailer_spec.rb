require "rails_helper"

RSpec.describe TaskMailer, type: :mailer do
  let(:team) { create(:team) }
  let(:lead) { create(:user, :team_lead, team: team) }
  let(:member) { create(:user, :team_member, team: team, skills: "html,css,js,ruby,rails") }
  let(:task) do
    create(:task,
      description: "Test task",
      team: team,
      created_by: lead.id,
      assigned_user: member,
      due_date: Date.today + 5,
      points: 10
    )
  end

  describe "#new_task" do
    let(:mail) { TaskMailer.new_task(task) }

    it "renders the correct subject" do
      expect(mail.subject).to eq("New task assigned: #{task.description}")
    end

    it "sends to the assignee" do
      expect(mail.to).to eq([ member.email ])
    end

    it "sends from the default mailer address" do
      expect(mail.from).to eq([ "from@example.com" ])
    end

    it "includes the assignee name in the body" do
      expect(mail.body.encoded).to include(member.name)
    end

    it "includes the task description in the body" do
      expect(mail.body.encoded).to include(task.description)
    end

    it "includes the due date in the body" do
      expect(mail.body.encoded).to include(task.due_date.strftime("%B %d, %Y"))
    end
  end

  describe "#deadline_reminder" do
    let(:mail) { TaskMailer.deadline_reminder(task) }

    it "renders the correct subject" do
      expect(mail.subject).to eq("Reminder: \"#{task.description}\" is due tomorrow")
    end

    it "sends to the assignee" do
      expect(mail.to).to eq([ member.email ])
    end

    it "sends from the default mailer address" do
      expect(mail.from).to eq([ "from@example.com" ])
    end

    it "includes the assignee name in the body" do
      expect(mail.body.encoded).to include(member.name)
    end

    it "includes the task description in the body" do
      expect(mail.body.encoded).to include(task.description)
    end
  end
end
