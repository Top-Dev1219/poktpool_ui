import PageLayout from '../../../../components/PageLayout'
import Link from 'next/link'
export const NotificationDetail = () => {
  return (
    <PageLayout title="Notification">
      <div className="max-w-4xl mx-auto">
        <h2>🐻 The poktpool Bear-Buster is here! 🐻 </h2>
        <p>
          👩‍💻 On behalf of the entire team at poktpool, I wanted to take a moment
          to express our heartfelt gratitude for your loyalty and support over
          the past year. We are so grateful to have such a diverse and engaged
          community of over 10,000 members from all around the world.
        </p>
        <p>
          💻 As we look back on the past year, it&rsquo;s clear that the market
          has continued to grow and evolve. Despite the challenges and
          uncertainties that we all faced, our team worked hard to deliver
          innovative solutions that helped our members navigate the market and
          make informed decisions.
        </p>
        <p>
          ☃️ The holiday season is a time for reflection and appreciation, and
          we are so thankful for the opportunity to serve you and be a part of
          your journey in the POKT ecosystem. We are constantly amazed by the
          resilience and determination of our members, and we are committed to
          supporting you as you continue to grow and succeed in this exciting
          and dynamic industry.
        </p>
        <p>
          🥳 We hope that you have a wonderful holiday season and that the
          coming year brings you joy, prosperity, and success. Thank you for
          choosing poktpool as your partner in the POKT ecosystem. We look
          forward to continued growth and success together in the coming year.
        </p>
        <p>
          🙏 Thank you for your continued community engagement and support. ❤️{' '}
        </p>
        <p>Happy staking!! 😎</p>
        <p className="mt-16">
          Have questions?&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Link href="/contact-us" passHref>
            <span className="text-brand-blue-dark cursor-pointer hover:underline">
              Contact Us?
            </span>
          </Link>{' '}
        </p>
      </div>
    </PageLayout>
  )
}
