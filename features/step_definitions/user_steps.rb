# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  team = Team.create!(name: "Test Team")
  @user = User.create!(
    name: name,
    email: "chris@example.com",
    role: "team_member",
    skills: [ "React", "CSS" ],
    password: "password123",
    password_confirmation: "password123",
    team: team
    )
  visit "/"
  fill_in "Email", with: "chris@example.com"
  fill_in "Password", with: "password123"
  click_button "Log in"
end

When('I click the {string} button') do |button_text|
  click_button button_text
end

Then('I should see {string} within the skill tags') do |skill|
  expect(page).to have_css('.skill-tag', text: skill)
end

Then('I should see {string} as my role') do |role_text|
  expect(page).to have_content(role_text)
end

Given('a team exists named {string}') do |team_name|
  Team.find_or_create_by!(name: team_name)
end
