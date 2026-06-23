import { Hero } from '@/components/marketing/Hero'
import { MarqueeSection } from '@/components/marketing/MarqueeSection'
import { ShowcaseSection } from '@/components/marketing/ShowcaseSection'
import { WorkflowSection } from '@/components/marketing/WorkflowSection'
import { DualModeSection } from '@/components/marketing/DualModeSection'
import { FeaturedToolsSection } from '@/components/marketing/FeaturedToolsSection'
import { PrivacySection } from '@/components/marketing/PrivacySection'
import { CtaSection } from '@/components/marketing/CtaSection'

export function Landing() {
  return (
    <>
      <Hero />
      <MarqueeSection />
      <ShowcaseSection />
      <WorkflowSection />
      <DualModeSection />
      <FeaturedToolsSection />
      <PrivacySection />
      <CtaSection />
    </>
  )
}
