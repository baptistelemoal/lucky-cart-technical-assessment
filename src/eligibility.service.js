class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    for (const key in criteria) {
      if (
        !this.evaluateCondition(cart, {
          path: key.split("."),
          criteria: criteria[key],
        })
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a condition based on the cart data.
   * The condition is an object with two properties: the path and the criteria.
   *
   * @param cart
   * @param condition
   * @return {boolean}
   */
  evaluateCondition(cart, condition) {
    const { path, criteria } = condition;

    let value = cart;
    for (const segment of path) {
      if (value === undefined) {
        return false;
      } else if (Array.isArray(value)) {
        value = value.map((item) => item[segment]);
      } else {
        value = value[segment];
      }
    }

    if (Array.isArray(value)) {
      return value.some((val) => this.checkCriteria(val, criteria));
    } else {
      return this.checkCriteria(value, criteria);
    }
  }

  /**
   * Check if a value corresponds to the criteria.
   * The criteria can be a simple value or an object with an operator
   *
   * @param value
   * @param criteria
   * @return {boolean}
   */
  checkCriteria(value, criteria) {
    const hasOperator = typeof criteria === "object";
    if (hasOperator) {
      switch (true) {
        case "gt" in criteria:
          return value > criteria.gt;
        case "lt" in criteria:
          return value < criteria.lt;
        case "gte" in criteria:
          return value >= criteria.gte;
        case "lte" in criteria:
          return value <= criteria.lte;
        case "in" in criteria:
          return criteria.in.includes(value);
        case "and" in criteria:
          return Object.keys(criteria.and).every((key) =>
            this.checkCriteria(value, { [key]: criteria.and[key] })
          );
        case "or" in criteria:
          return Object.keys(criteria.or).some((key) =>
            this.checkCriteria(value, { [key]: criteria.or[key] })
          );
      }
    } else {
      return value == criteria;
    }

    return false;
  }
}

module.exports = {
  EligibilityService,
};
