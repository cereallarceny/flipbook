'use client';

import GitHubButton from 'react-github-btn';

export function Star(): JSX.Element {
  return (
    <GitHubButton
      aria-label="Star cereallarceny/flipbook on GitHub"
      data-icon="octicon-star"
      data-show-count="true"
      data-size="large"
      href="https://github.com/cereallarceny/flipbook"
      key="star"
    >
      Star
    </GitHubButton>
  );
}

export function Sponsor(): JSX.Element {
  return (
    <GitHubButton
      aria-label="Sponsor @cereallarceny on GitHub"
      data-icon="octicon-heart"
      data-size="large"
      href="https://github.com/sponsors/cereallarceny"
      key="sponsor"
    >
      Sponsor
    </GitHubButton>
  );
}
