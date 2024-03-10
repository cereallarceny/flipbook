// TODO: WebRTC doesn't work on mobile at all...
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer
// TODO: Consider releasing different readers as separate packages or as tree-shakable imports
// TODO: Create a series of "help wanted" issues for people to contribute to based on contributing.md
// TODO: Do this: https://docs.pwabuilder.com/#/builder/quick-start?id=packaging
// TODO: Post to HN

import Hero from './hero';

export default function Page(): JSX.Element {
  return (
    <div>
      <Hero />
    </div>
  );
}
