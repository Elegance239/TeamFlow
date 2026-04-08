# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  team = Team.create!(name: "Test Team")
  @user = User.create!(
    name: name,
    email: "chris@example.com",
    role: "team_member",
    skills: "React,CSS",
    password: "password123",
    password_confirmation: "password123",
    team: team
  )
  visit "/"
  # expect(page).to have_field("Email", wait: 5)
  find('input#email', visible: :all).set("chris@example.com")
  find('input#password', visible: :all).set("password123")
  # fill_in "Email", with: "chris@example.com"
  # fill_in "Password", with: "password123"
  click_button "Sign in"
end


When('I click the {string} menu item') do |item_text|
  find('button[aria-label="open drawer"]').click
  sleep 1
  find('span.MuiListItemText-primary', text: item_text).click
end

Then('I should see {string} within the skill tags') do |skill|
  expect(page).to have_css('.skill-tag', text: skill)
end

Then("I should see {string} as my role") do |role|
  expect(page).to have_field(with: role)
end
