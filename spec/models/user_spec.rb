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

    it "normalizes skills into a lowercased comma-separated string" do
      user = build(:user, skills: " React, CSS,react ")
      user.valid?

      expect(user.skills).to eq("react,css")
      expect(user.skills_list).to eq([ "react", "css" ])
    end
  end

  describe "team membership" do
    it "is invalid without a team" do
      user = build(:user, team: nil)
      expect(user).not_to be_valid
      expect(user.errors[:team]).to be_present
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
