// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useState, useRef, useEffect } from "react";

export interface IUseTimerResponse {
  elapsedTime: number;
  isRunning: boolean;
  startTimer: (startDate?: Date) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const useTimer = (): IUseTimerResponse => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const countRef = useRef<undefined | NodeJS.Timer>(undefined);

  const startTimer = (startDate?: Date) => {
    const startTime = startDate ? startDate.getTime() : Date.now() - elapsedTime;
    countRef.current = setInterval(() => {
      setElapsedTime(startDate ? startDate.getTime() : Date.now() - startTime);
    }, 10);
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      setIsRunning(false);
      setElapsedTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (countRef.current) {
        clearInterval(countRef.current);
      }
    };
  }, [countRef]);
  return { elapsedTime, isRunning, startTimer, stopTimer, resetTimer };
};

export default useTimer;
