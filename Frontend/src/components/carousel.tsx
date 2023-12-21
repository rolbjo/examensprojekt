import React from 'react'
import { Carousel } from 'react-bootstrap'
import '../styles/components/carousel.scss'

interface CarouselProps {
  interval: number
}

const MyCarousel: React.FC<CarouselProps> = ({ interval }) => {
  return (
    <div className='carouselDiv'>
      <Carousel interval={interval}>
        <Carousel.Item>
          <img
            className='d-block'
            src='https://source.unsplash.com/random/800x400'
            alt='First slide'
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className='d-block'
            src='https://source.unsplash.com/random/800x401'
            alt='Second slide'
          />
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default MyCarousel
