import Carousel from '../../src/components/Carousel'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

describe('Carousel', () => {
  it('should navigate through carousel slides', () => {
    cy.mount(
      <BrowserRouter>
        <Carousel interval={3000} />
      </BrowserRouter>
    )
    cy.wait(1000)

    cy.get('.carouselDiv').should('be.visible')

    cy.get('.carousel-control-next').click()
  })
})
