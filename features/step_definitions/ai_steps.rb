# features/step_definitions/ai_steps.rb
require 'cucumber/rspec/doubles'

Before('@javascript') do
  allow(Ai).to receive(:generate_task).and_return({
    "title" => "Implement a React search bar",
    "description" => "A high-quality search bar component using MUI.",
    "points" => 5,
    "due_days_from_now" => 3,
    "required_skills" => "react, mui"
  })
end

Given('the following team exists:') do |table|
  table.hashes.each do |row|
    Team.create!(row)
  end
end

Given('the following user exists:') do |table|
  table.hashes.each do |row|
    team = Team.find_by(name: row['team'])
    User.create!(
      name: row['name'],
      email: row['email'],
      password: row['password'],
      password_confirmation: row['password'],
      role: row['role'],
      team: team
    )
  end
end

Given('I am logged in as {string} with password {string}') do |email, password|
  user = User.find_by(email: email)
  
  visit "/users/sign_in"
  fill_in "Email", with: email
  fill_in "Password", with: password
  click_button "Sign in"
  
  page.execute_script("localStorage.setItem('teamflowCurrentUser', JSON.stringify(#{user.to_json}))")
  sleep 1
end

When('I open the task creation dialog') do
  find('button[aria-label="add-task"]').click
  expect(page).to have_text("Create Task", wait: 5)
end

When('I enter {string} into the AI prompt') do |prompt|
  fill_in "Type here to generate with AI (e.g. 'Create a React login form, 5 points, due in 3 days')", with: prompt
end

When('I click the "Magic Wand" icon') do
  find('button[aria-label="generate-with-ai"]').click

  sleep 2 
end

Then('the title should contain {string}') do |text|
  expect(page.find_field('title').value).to include(text)
end

Then('the description should contain {string}') do |text|
  expect(page.find_field('description').value).to include(text)
end

Then('the required skills should contain {string}') do |text|
  expect(page.find_field('required_skills (comma-separated)').value).to include(text)
end

Then('the points should be a positive integer') do
  val = page.find_field('points').value.to_i
  expect(val).to be > 0
end

Then('the due date should be set to a future date') do
  val = page.find_field('due_date').value
  expect(Date.parse(val)).to be >= Date.today
end
