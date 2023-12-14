import Carousel from 'react-bootstrap/Carousel'

import React from 'react'

function carousel() {
  return (
    <Carousel data-bs-theme='dark'>
      <Carousel.Item>
        <img
          className='d-block w-100'
          src='https://example.com/slide1.jpg'
          alt='First slide'
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className='d-block w-100'
          src='https://example.com/slide2.jpg'
          alt='Second slide'
        />
      </Carousel.Item>
    </Carousel>
  )
}

export default carousel
