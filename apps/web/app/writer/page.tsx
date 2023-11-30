import { Button } from '../components/button';
import { description, titleWithoutName } from '../content';
import Hero from './hero';
import Playground from './components/playground';
import { Sponsor, Star } from './components/github-button';

// ----- Features ----- //
// TODO: Figure out a way to do this without passing a canvas via React
//  - Currently renders a black gif as a result of putting this in the compose file
// TODO: Find a better way to do reader with just one function, hide canvas complexity
// TODO: Add an "advanced mode" where you can pass a lot more options
// TODO: Look into performance issues with screen reading
// TODO: Find a better way to process more than 2-3 frames
// TODO: Write tests and manage coverage
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer

// ----- UI/UX ----- //
// TODO: Add a proper readme
// TODO: Create better logs and only output them if desired in the console
// TODO: Create homepage to advertise the reader

// ----- Final Steps ----- //
// TODO: Create a series of "help wanted" issues for people to contribute to
// - Bindings for other languages?
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
              <div className="-mb-1">
                <Star />
              </div>
            ),
          },
          {
            id: 'sponsor',
            children: (
              <div className="-mb-1">
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
