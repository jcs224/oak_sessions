describe('Sessions Test', () => {
  it('Check for correct session value on page refresh', () => {
    cy.visit('http://localhost:8002')
      .contains('First counter: 0')
      .contains('Second counter: 0')
      .contains('FIRST FLASH!!')

    cy.get('#inc-button').click()
    cy.contains('First counter: 1')
    .contains('Second counter: 0')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button').click()
    cy.contains('First counter: 2')
    .contains('Second counter: 0')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button-2').click()
    cy.contains('First counter: 2')
    .contains('Second counter: 1')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button-2').click()
    cy.contains('First counter: 2')
    .contains('Second counter: 2')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button-2').click()
    cy.contains('First counter: 2')
    .contains('Second counter: 3')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button').click()
    cy.contains('First counter: 3')
    .contains('Second counter: 3')
    .contains('FLASH!!')

    cy.get('#inc-button').click()
    cy.contains('First counter: 4')
    .contains('Second counter: 3')
    .should('not.contain', 'FLASH!!')

    cy.get('#inc-button').click()
    cy.contains('First counter: 5')
    .contains('Second counter: 3')
    .should('not.contain', 'FLASH!!')

    cy.get('#del-button').click()
    cy.contains('First counter: 0')
    .contains('Second counter: 0')
    .contains('FLASH!!')
  })
})