require 'rails_helper'

RSpec.describe Team, type: :model do
  describe "validations" do
    it "is valid with a unique name" do
      team = build(:team, name: "Alpha")
      expect(team).to be_valid
    end

    it "is invalid without a name" do
      team = build(:team, name: nil)
      expect(team).not_to be_valid
      expect(team.errors[:name]).to be_present
    end

    it "is invalid with a duplicate name" do
      create(:team, name: "Alpha")
      duplicate = build(:team, name: "Alpha")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to be_present
    end

    it "is case-insensitively unique" do
      create(:team, name: "Alpha")
      duplicate = build(:team, name: "alpha")
      expect(duplicate).not_to be_valid
    end
  end

  describe "associations" do
    it "has many users" do
      team = create(:team, name: "Dev")
      create(:user, :team_lead, name: "Alice", team: team)
      create(:user, name: "Bob", team: team)

      expect(team.users.count).to eq(2)
    end

    it "nullifies user team_id when team is destroyed" do
      team = create(:team, name: "Temp")
      user = create(:user, name: "Alice", team: team)

      team.destroy
      expect(user.reload.team_id).to be_nil
    end
  end
end
