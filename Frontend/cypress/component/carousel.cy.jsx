import Carousel from '../../src/components/carousel'
import React from 'react'

describe('Carousel', () => {
  it('should navigate through carousel slides', () => {
    cy.mount(<Carousel />)

    cy.get('.carousel').should('be.visible')

    cy.get('.carousel-control-next').click()
  })
})
