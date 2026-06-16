import React from "react";
import "./simple-card-grid.css";

interface SimpleCardGridProps {
  title: string;
  items: string[]; // solo nombres
  accentColor?: string;
}

const SimpleCardGrid: React.FC<SimpleCardGridProps> = ({
  title,
  items,
  accentColor = "#FFFFFF",
}) => {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ borderLeft: `6px solid ${accentColor}`, paddingLeft: "10px" }}>
        {title}
      </h3>

      <div className="simple-grid">
        {items.map((item, idx) => (
          <div key={idx} className="simple-card">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimpleCardGrid;
