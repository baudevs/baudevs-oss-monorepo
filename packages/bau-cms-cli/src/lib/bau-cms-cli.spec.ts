import { describe, it, expect } from '@jest/globals';
import { bauCmsCli } from './bau-cms-cli';

describe('bauCmsCli', () => {
  it('should work', () => {
    expect(bauCmsCli()).toEqual('bau-cms-cli');
  });
});
