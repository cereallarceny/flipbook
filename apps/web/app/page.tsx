// TODO: Entire screen capture doesn't work
// TODO: Consider releasing different readers as separate packages or as tree-shakable imports
// TODO: Release reader and writer as separate packages to NPM: @flipbook/reader and @flipbook/writer
// TODO: Create a series of "help wanted" issues for people to contribute to based on contributing.md
// TODO: Post to HN

import Hero from './hero';

export default function Page(): JSX.Element {
  return (
    <div>
      <Hero />
    </div>
  );
}
