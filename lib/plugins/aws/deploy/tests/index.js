'use strict';

const AwsDeploy = require('../index');
const Serverless = require('../../../../Serverless');
const expect = require('chai').expect;
const BbPromise = require('bluebird');
const sinon = require('sinon');

describe('AwsDeploy', () => {
  let awsDeploy;
  beforeEach(() => {
    const serverless = new Serverless();
    const options = {
      stage: 'dev',
      region: 'us-east-1',
    };

    awsDeploy = new AwsDeploy(serverless, options);
    awsDeploy.serverless.cli = new serverless.classes.CLI();
  });

  describe('#constructor()', () => {
    it('should have hooks', () => expect(awsDeploy.hooks).to.be.not.empty);

    it('should set the provider variable to "aws"', () => expect(awsDeploy.provider)
      .to.equal('aws'));
  });

  describe('hooks', () => {
    it('should run "before:deploy:initialize" hook promise chain in order', () => {
      const validateStub = sinon
        .stub(awsDeploy, 'validate').returns(BbPromise.resolve());

      return awsDeploy.hooks['before:deploy:initialize']().then(() => {
        expect(validateStub.calledOnce).to.be.equal(true);
      });
    });

    it('should run "deploy:setupProviderConfiguration" hook promise chain in order', () => {
      const createStackStub = sinon
        .stub(awsDeploy, 'createStack').returns(BbPromise.resolve());
      const monitorStackStub = sinon
        .stub(awsDeploy, 'monitorStack').returns(BbPromise.resolve());

      return awsDeploy.hooks['deploy:setupProviderConfiguration']().then(() => {
        expect(createStackStub.calledOnce).to.be.equal(true);
        expect(monitorStackStub.calledOnce).to.be.equal(true);
      });
    });

    it('should run "before:deploy:compileFunctions" promise chain in order', () => {
      const generateArtifactDirectoryNameStub = sinon
        .stub(awsDeploy, 'generateArtifactDirectoryName').returns(BbPromise.resolve());

      return awsDeploy.hooks['before:deploy:compileFunctions']().then(() => {
        expect(generateArtifactDirectoryNameStub.calledOnce).to.be.equal(true);
      });
    });

    it('should run "deploy:initialize" promise chain in order', () => {
      const configureStackStub = sinon
        .stub(awsDeploy, 'configureStack').returns(BbPromise.resolve());

      const mergeCustomProviderResourcesStub = sinon
        .stub(awsDeploy, 'mergeCustomProviderResources').returns(BbPromise.resolve());

      return awsDeploy.hooks['deploy:initialize']().then(() => {
        expect(configureStackStub.calledOnce).to.be.equal(true);
        expect(mergeCustomProviderResourcesStub.calledOnce).to.be.equal(true);
      });
    });

    it('should run "deploy:deploy" promise chain in order', () => {
      const setBucketNameStub = sinon
        .stub(awsDeploy, 'setBucketName').returns(BbPromise.resolve());
      const cleanupS3BucketStub = sinon
        .stub(awsDeploy, 'cleanupS3Bucket').returns(BbPromise.resolve());
      const uploadArtifactsStub = sinon
        .stub(awsDeploy, 'uploadArtifacts').returns(BbPromise.resolve());
      const updateStackStub = sinon
        .stub(awsDeploy, 'updateStack').returns(BbPromise.resolve());
      const monitorStackStub = sinon
        .stub(awsDeploy, 'monitorStack').returns(BbPromise.resolve());

      return awsDeploy.hooks['deploy:deploy']().then(() => {
        expect(setBucketNameStub.calledOnce).to.be.equal(true);
        expect(cleanupS3BucketStub.calledAfter(setBucketNameStub))
          .to.be.equal(true);
        expect(uploadArtifactsStub.calledAfter(cleanupS3BucketStub))
          .to.be.equal(true);
        expect(updateStackStub.calledAfter(uploadArtifactsStub))
          .to.be.equal(true);
        expect(monitorStackStub.calledAfter(updateStackStub))
          .to.be.equal(true);
      });
    });

    it('should notify about noDeploy', () => {
      sinon.stub(awsDeploy, 'setBucketName').returns(BbPromise.resolve());
      sinon.stub(awsDeploy, 'cleanupS3Bucket').returns(BbPromise.resolve());
      sinon.stub(awsDeploy, 'uploadArtifacts').returns(BbPromise.resolve());
      sinon.stub(awsDeploy, 'updateStack').returns(BbPromise.resolve());
      sinon.stub(awsDeploy, 'monitorStack').returns(BbPromise.resolve());
      sinon.stub(awsDeploy.serverless.cli, 'log').returns();
      awsDeploy.options.noDeploy = true;

      return awsDeploy.hooks['deploy:deploy']().then(() => {

      });
    });
  });
});
