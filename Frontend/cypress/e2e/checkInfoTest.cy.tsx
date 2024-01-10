describe('Carousel', () => {
  it('Should show a destination when searching', () => {
    cy.visit('http://localhost:3000/Dubai')

    cy.get('.Desth1').should('include.text', 'Dubai')
    cy.get('.WhenToTravel').should('include.text', 'Winter')
  })
})
