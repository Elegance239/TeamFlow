# features/step_definitions/team_steps.rb

Given('I am on the signup page') do
  visit "/"
  find('button', text: 'Sign up').click
end

Then('I should be on the signin page') do
  expect(page).to have_content("Sign in")
end

When('I choose {string} from {string}') do |option, _label|
  find('label', text: option).click
end

When('I choose {string}') do |option|
  find('label', text: option).click
end

When('I log in with email {string} and password {string}') do |email, password|
  visit "/"
  fill_in "Email", with: email
  fill_in "Password", with: password
  click_button "Sign in"
end

When('I open the drawer') do
  find('button[aria-label="open drawer"]').click
end

Then('I should see {string} as the team name in the drawer') do |team_name|
  within('.MuiDrawer-paper') do
    expect(page).to have_content(team_name)
  
  end
end
