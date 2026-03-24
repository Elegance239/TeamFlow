# features/step_definitions/user_steps.rb

Given('I am logged in as {string}') do |name|
  @user = User.create!(name: name, role: "team_member", skills: [ "React", "CSS" ])
  visit login_path
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
