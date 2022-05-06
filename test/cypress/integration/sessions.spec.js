describe('Sessions Test', () => {
  it('logs in a user after a couple of mistakes', () => {
    // 1st failed login attempt
    cy.visit('http://localhost:8002')
    cy.get('#email').type('test@test.com')
    cy.get('#password').type('incorrect')
    cy.get('#login').submit()
    cy.contains('Incorrect username or password') // flash
    cy.contains('Failed login attempts: 1')       // session

    // Refresh page, 2nd failed login attempt
    cy.visit('http://localhost:8002')
      .contains('Failed login attempts: 1')
      .should('not.contain', 'Incorrect username or password') // flash is consumed
    cy.get('#email').type('test@test.com')
    cy.get('#password').type('wrong')
    cy.get('#login').submit()

    cy.contains('Incorrect username or password') // flash
    cy.contains('Failed login attempts: 2')       // session

    // 3rd login attempt - successful
    cy.get('#email').type('test@test.com')
    cy.get('#password').type('correct')
    cy.get('#login').submit()
    cy.contains('Login successful') // flash

    // Refresh page and log out
    cy.visit('http://localhost:8002')
      .contains('Log out test@test.com')
      .should('not.contain', 'Login successful') // flash is consumed
    cy.get('#logout').submit()

    // One last failed login attempt
    cy.visit('http://localhost:8002')
    cy.get('#email').type('test@test.com')
    cy.get('#password').type('incorrect')
    cy.get('#login').submit()
    cy.contains('Incorrect username or password')
    cy.contains('Failed login attempts: 1')
  })
})