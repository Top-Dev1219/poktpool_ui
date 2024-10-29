import React, { Component } from 'react'
import Slider from 'react-slick'
import Image from 'next/image'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'

const reviewScreenshots = [
  '/images/reviews/review_1.jpg',
  '/images/reviews/review_2.jpg',
  '/images/reviews/review_3.jpg',
  '/images/reviews/review_4.jpg',
]

const ReviewSlider = () => {
  const settings = {
    dots: false,
    arrow: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }
  return (
    <div className="px-4">
      <Slider {...settings}>
        {reviewScreenshots.map((review, index) => (
          <div
            key={index}
            className="w-full h-60 sm:h-48 lg:h-56 xl:h-60 3xl:h-[300px] rounded-lg"
          >
            <img
              src={review}
              alt="Clients Twitter Review"
              className="w-full h-full object-contain object-center rounded-lg"
            />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ReviewSlider
