import { Button } from '../components/button';
import { meta, writer } from '../content';
import Hero from './hero';
import Playground from './components/playground';
import { Sponsor, Star } from './components/github-button';

export default function Page(): JSX.Element {
  return (
    <div>
      <Hero
        buttons={[
          {
            id: 'github',
            children: (
              <Button as="a" href="https://github.com/cereallarceny/flipbook">
                {writer.github}
              </Button>
            ),
          },
          {
            id: 'star',
            children: (
              <div className="-mb-4 sm:-mb-1">
                <Star />
              </div>
            ),
          },
          {
            id: 'sponsor',
            children: (
              <div className="-mb-4 sm:-mb-1">
                <Sponsor />
              </div>
            ),
          },
        ]}
        description={meta.description}
        title={meta.titleWithoutName}
      >
        <Playground />
      </Hero>
    </div>
  );
}
