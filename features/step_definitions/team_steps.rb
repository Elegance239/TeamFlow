# features/step_definitions/team_steps.rb

Given('I am on the signup page') do
  visit "/"
  find('input[name="email"]', wait: 30)
  expect(page).to have_content("Sign in")
  click_button "Sign up"
end

Then('I should be on the signin page') do
  expect(page).to have_content("Sign in")
end

When('I choose {string} from {string}') do |option_text, _label_text|
  # MUI Radios/Selects usually work best by simply clicking the label containing the text
  begin
    # Look for the label associated with the radio option
    find('label', text: option_text).click
  rescue Capybara::ElementNotFound
    # Fallback: Click the span or text directly
    find('.MuiFormControlLabel-label', text: option_text).click
  end
end

When('I choose {string}') do |option|
  find('label', text: option).click
end


When('I open the drawer') do
  find('button[aria-label="open drawer"]').click
end

Then('I should see {string} as the team name in the drawer') do |team_name|
  within('.MuiDrawer-paper') do
    expect(page).to have_content(team_name)
  end
end
