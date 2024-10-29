import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import PageLayout from '../../../../components/PageLayout'
import FullColorLong from '../../../../public/images/press-kit/long/RGB-fullcolor-long.png'
import FullColorRevLong from '../../../../public/images/press-kit/long/RGB-fullcolor-rev-long.png'
import GreyScaleLong from '../../../../public/images/press-kit/long/RGB-greyscale-long.png'
import GreyScaleRevLong from '../../../../public/images/press-kit/long/RGB-greyscale-rev-long.png'
import OneColorLong from '../../../../public/images/press-kit/long/RGB-onecolor-long.png'
import OneColorRevLong from '../../../../public/images/press-kit/long/RGB-onecolor-rev-long.png'
import FullColorSquare from '../../../../public/images/press-kit/square/RGB-fullcolor-square.png'
import GreyScaleSqure from '../../../../public/images/press-kit/square/RGB-greyscale-square.png'
import OneColorSqure from '../../../../public/images/press-kit/square/RGB-onecolor-square.png'
import OneColorRevSquare from '../../../../public/images/press-kit/square/RGB-onecolor-rev-square.png'
import GreyScaleRevSquare from '../../../../public/images/press-kit/square/RGB-greyscale-rev-square.png'
import FullColorRevSquare from '../../../../public/images/press-kit/square/RGB-fullcolor-rev-square.png'
import FullColorGlyph from '../../../../public/images/press-kit/glyph/RGB-fullcolor-glyph.png'
import GreyScaleGlyph from '../../../../public/images/press-kit/glyph/RGB-greyscale-glyph.png'
import OneColorGlyph from '../../../../public/images/press-kit/glyph/RGB-onecolor-glyph.png'
import OneColorRevGlyph from '../../../../public/images/press-kit/glyph/RGB-onecolor-rev-glyph.png'
import GreyScaleRevGlyph from '../../../../public/images/press-kit/glyph/RGB-greyscale-rev-glyph.png'
import FullColorRevGlyph from '../../../../public/images/press-kit/glyph/RGB-fullcolor-rev-glyph.png'

export const PressKit = () => {
  return (
    <PageLayout title="press-kit" isPressKit={true}>
      <div className="max-w-5xl mx-auto">
        <div className="mt-16">
          <h3>Brand Guideline</h3>
          <div className="bg-brand-blue-dark rounded-lg p-4 sm:w-2/5">
            <Image
              src={OneColorRevLong}
              alt="Full Color Long Logo"
              width={320}
              height={90}
            />
            <div className="pl-6">
              <a
                href="/images/press-kit/POK-2023-Brand-Sheet-FINAL.pdf"
                target="_blank"
                className="text-white text-lg underline"
              >
                Brand Guidelines
              </a>
              <p className="text-white mt-2 mb-0">
                Last updated on June 20th, 2023
              </p>
            </div>
          </div>
        </div>
        <h3 className="mt-16">Logo</h3>
        <div>
          <h4>Long Logos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="grid-item">
              <Image src={FullColorLong} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-fullcolor-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={GreyScaleLong} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-greyscale-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={OneColorLong} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-onecolor-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={FullColorRevLong} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-fullcolor-rev-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={GreyScaleRevLong} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-greyscale-rev-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={OneColorRevLong} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/long/RGB-onecolor-rev-long.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-32">
          <h3>Square Logos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-12">
            <div className="grid-item">
              <Image src={FullColorSquare} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-fullcolor-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={GreyScaleSqure} alt="Grey Scale Square Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-greyscale-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={OneColorSqure} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-onecolor-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={OneColorRevSquare} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-onecolor-rev-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={GreyScaleRevSquare} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-greyscale-rev-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={FullColorRevSquare} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/square/RGB-fullcolor-rev-square.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <h3>Glyph Logos</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-16">
            <div className="grid-item">
              <Image src={FullColorGlyph} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-fullcolor-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={GreyScaleGlyph} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-fullcolor-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <Image src={OneColorGlyph} alt="Full Color Long Logo" />
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-fullcolor-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={OneColorRevGlyph} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-onecolor-rev-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={GreyScaleRevGlyph} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-onecolor-rev-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
            <div className="grid-item">
              <div className="bg-brand-blue-dark">
                <Image src={FullColorRevGlyph} alt="Full Color Long Logo" />
              </div>
              <div className="text-center">
                <a
                  href="/images/press-kit/glyph/RGB-onecolor-rev-glyph.png"
                  download
                  className="text-brand-blue-dark"
                >
                  PNG
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <h3>Colors</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-8">
            <div className="grid-item">
              <div className="py-7 bg-brand-blue-dark text-white text-center">
                {'[ Blue ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #0366FF</p>
              <p className="text-center text-sm my-1">CMYK: 100, 20, 0, 40</p>
              <p className="text-center text-sm my-0">RGB: 0, 98, 147</p>
            </div>
            <div className="grid-item">
              <div className="py-7 bg-brand-orange text-white text-center">
                {'[ Orange ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #FF7800</p>
              <p className="text-center text-sm my-1">CMYK: 0, 60, 90, 0</p>
              <p className="text-center text-sm my-0">RGB: 240, 126, 32</p>
            </div>
            <div className="grid-item">
              <div className="py-7 bg-black text-white text-center">
                {'[ Black ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #000000</p>
              <p className="text-center text-sm my-1">CMYK: 0, 0, 0, 100</p>
              <p className="text-center text-sm my-0">RGB: 0, 0, 0</p>
            </div>
            <div className="grid-item">
              <div className="py-7 bg-brand-yellow text-black text-center">
                {'[ Yellow ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #FFD100</p>
              <p className="text-center text-sm my-1">CMYK: 0, 18, 90, 0</p>
              <p className="text-center text-sm my-0">RGB: 255, 209, 27</p>
            </div>
            <div className="grid-item">
              <div className="py-7 bg-brand-light-grey text-white text-center">
                {'[ Light Grey ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #808080</p>
              <p className="text-center text-sm my-1">CMYK: 0, 0, 0, 50</p>
              <p className="text-center text-sm my-0">RGB: 128, 128, 128</p>
            </div>
            <div className="grid-item">
              <div className="py-7 bg-brand-blue-light text-black text-center">
                {'[ Light Blue ]'}
              </div>
              <p className="text-center text-sm mb-0">HEX: #09D7FE</p>
              <p className="text-center text-sm my-1">CMYK: 60, 0, 5, 0</p>
              <p className="text-center text-sm my-0">RGB: 93, 197, 234</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
