describe('Sessions Test', () => {
  it('Check for correct session value on page refresh', () => {
    cy.visit('http://localhost:8002')
      .contains('0 times!')
      .contains('FLASH!!')

    cy.reload()
    .contains('1 times!')
    .should('not.contain', 'FLASH!!')

    cy.reload()
    .contains('2 times!')
    .should('not.contain', 'FLASH!!')

    cy.reload()
    .contains('3 times!')
    .contains('FLASH!!')

    cy.reload()
    .contains('4 times!')
    .should('not.contain', 'FLASH!!')

    cy.reload()
    .contains('5 times!')
    .should('not.contain', 'FLASH!!')
  })
})