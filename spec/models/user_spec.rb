require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    it "is valid with a name" do
      user = build(:user, name: "Alice")
      expect(user).to be_valid
    end

    it "is invalid without a name" do
      user = build(:user, name: nil)
      expect(user).not_to be_valid
      expect(user.errors[:name]).to be_present
    end

    it "can store a list of skills" do
      user = build(:user, skills: [ "React", "CSS" ])
      expect(user.skills).to include("React")
    end
  end

  describe "guest mode" do
    it "can be created without a team (guest)" do
      user = create(:user, :guest, name: "Guest User")
      expect(user.team).to be_nil
      expect(user.role).to be_nil
    end
  end

  describe "associations" do
    it "belongs to a team" do
      team = create(:team)
      user = create(:user, name: "Bob", team: team)
      expect(user.team).to eq(team)
    end
  end

  describe "role enum" do
    it "can be team_lead or team_member only" do
      lead_user = create(:user, :team_lead, name: "Lead")
      expect(lead_user.team_lead?).to be true

      non_lead_user = create(:user, name: "Member")
      expect(non_lead_user.team_member?).to be true

      expect {
        create(:user, role: :non_lead_user)
      }.to raise_error(ArgumentError)
    end
  end
end
