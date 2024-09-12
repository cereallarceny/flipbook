import { useEffect, useState } from 'react';

export default function useNavigatorSupport() {
  const [userMediaSupport, setUserMediaSupport] = useState<boolean>(false);
  const [displayMediaSupport, setDisplayMediaSupport] =
    useState<boolean>(false);

  useEffect(() => {
    if (navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia) {
      setUserMediaSupport(true);
    }

    if (navigator.mediaDevices && !!navigator.mediaDevices.getDisplayMedia) {
      setDisplayMediaSupport(true);
    }
  }, []);

  return {
    getUserMedia: userMediaSupport,
    getDisplayMedia: displayMediaSupport,
  };
}
