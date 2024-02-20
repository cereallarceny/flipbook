import { Button } from '../components/button';
import { description, titleWithoutName } from '../content';
import Hero from './hero';
import Playground from './components/playground';
import { Sponsor, Star } from './components/github-button';

// TODO: Create homepage to advertise the reader
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer
// TODO: Create a series of "help wanted" issues for people to contribute to based on contributing.md
// TODO: Post to HN

export default function Page(): JSX.Element {
  return (
    <div>
      <Hero
        buttons={[
          {
            id: 'github',
            children: (
              <Button as="a" href="https://github.com/cereallarceny/flipbook">
                View on Github
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
        description={description}
        title={titleWithoutName}
      >
        <Playground />
      </Hero>
    </div>
  );
}
