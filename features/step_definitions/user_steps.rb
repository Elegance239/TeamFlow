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
  find('#email', wait: 10).fill_in(with: "chris@example.com")
  find('#password').fill_in(with: "password123")
  find('button[type="submit"]').click

  expect(page).to have_css('button[aria-label="add-task"]', wait: 10)
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
