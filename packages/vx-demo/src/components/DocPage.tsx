import React from 'react';
import Markdown from 'react-markdown/with-html';

import ApiTable from './ApiTable';
import Footer from './Footer';
import PackageList from './PackageList';
import Page from './Page';
import { DocGenInfo, VxPackage } from '../types';

type Props = {
  components?: DocGenInfo[];
  examples?: (React.ComponentClass | React.FC)[];
  vxPackage: VxPackage;
  readme: string;
};

export default function DocPage({ components, examples, vxPackage, readme }: Props) {
  return (
    <Page title={`@vx/${vxPackage} documentation`}>
      <div className="doc-container">
        <div className="doc-nav">
          <PackageList compact grid={false} emphasizePackage={vxPackage} />
        </div>
        <div className="doc-content">
          <div className="doc-readme">
            <Markdown escapeHtml={false} source={readme} />
          </div>
          {examples && examples.length > 0 && (
            <>
              <h2>Examples</h2>
              <div className="examples">
                {examples.map((example, i) => (
                  <div key={i} className="example">
                    {React.createElement(example)}
                  </div>
                ))}
              </div>
            </>
          )}
          {components && components.length > 0 && (
            <>
              <h2>Components</h2>
              <ul>
                {components.map(component => {
                  const { displayName = '' } = component;
                  const isComponent =
                    displayName && displayName[0].toLowerCase() !== displayName[0];
                  return (
                    <li key={displayName}>
                      <a href={`#${displayName}`}>
                        <code>
                          {isComponent && <>&lt;</>}
                          {displayName}
                          {isComponent && <>&nbsp;/&gt;</>}
                        </code>
                      </a>
                    </li>
                  );
                })}
              </ul>

              <h2>APIs</h2>
              {components.map(component => (
                <ApiTable key={component.displayName} docgenInfo={component} />
              ))}
            </>
          )}
        </div>
      </div>
      <Footer />
      <style jsx>{`
        .doc-container {
          margin-top: 24px;
          display: flex;
          flex-direction: row;
        }
        .doc-content {
          width: 100%;
        }
        .doc-content :global(h1) {
          margin-bottom: 1.2em;
          line-height: 0;
          font-size: 2em;
        }
        .doc-content :global(img) {
          max-width: 50vw;
          max-height: 50vh;
        }
        .doc-content :global(th),
        .doc-content :global(td) {
          border: 1px solid;
          padding: 5px 10px 5px 5px;
        }
        .doc-nav {
          margin-right: 5em;
          width: 140px;
          flex-shrink: 0;
        }
        @media (max-width: 600px) {
          .doc-container {
            flex-direction: column-reverse;
            min-width: 90vw;
            max-width: 90vw;
            margin: 0;
          }
        }
        .doc-content :global(code) {
          font-family: 'Menlo', monospace;
          font-weight: bold;
          padding: 0.2rem 0.3rem;
          background-color: #efefef;
          line-height: 1.8em;
          font-size: 0.8em;
        }
        .doc-content :global(code[class*='language-']) {
          background-color: transparent;
          font-weight: 300;
          color: #222;
          box-shadow: none;
        }
        .doc-readme :global(pre) {
          background-color: #efefef;
          display: inline-block;
          padding: 0.5em;
          min-width: 33vw;
          border-radius: 3px;
        }
        .doc-content :global(table) {
          border-collapse: collapse;
          font-size: 12px;
          font-family: monospace;
          line-height: 1em;
          border-color: #efefef;
          margin-top: 0.25rem;
        }
        .examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
      `}</style>
    </Page>
  );
}
