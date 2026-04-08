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
  email_input = find('input#email', visible: true, wait: 10)
  email_input.set("chris@example.com")

  password_input = find('input#password', visible: true, wait: 10)
  password_input.set("password123")

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
