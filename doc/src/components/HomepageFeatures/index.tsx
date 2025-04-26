import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "High Performance",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        <strong>linqq</strong> excels in handling in-memory data with high performance, making it ideal for complex data
        manipulation and analysis directly within your applications.
      </>
    ),
  },
  {
    title: "Rich Collection Operations",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        From filtering and sorting to aggregation and beyond, <strong>linqq</strong> offers a comprehensive suite of
        operations for in-memory collections, mirroring the power and flexibility of LINQ in .NET.
      </>
    ),
  },
  {
    title: "Type-Safe Fluent Interfaces",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Utilize fluent, chainable methods that are type-safe and easy to understand, ensuring that your code is not only
        powerful but also clean and maintainable.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
