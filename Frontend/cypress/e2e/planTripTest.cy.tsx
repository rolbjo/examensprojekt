describe('My travel site', () => {
  it('Should show planned trips', () => {
    cy.visit('http://localhost:3000')

    cy.contains('Trip Planner').click()
    cy.get('.SavedTripsInput[name="destination"]').type('Madagaskar')
    cy.get('.SavedTripsInput[name="startDate"]').type('2022-01-01')
    cy.get('.SavedTripsInput[name="endDate"]').type('2022-01-07')
    cy.get('.PlanTripsButton').click()
    cy.get('.MySavedTrips').should('include.text', 'Madagaskar')
  })
})
