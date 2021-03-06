import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";

import { isObscured } from "metabase/lib/dom";

import Tooltip from "./Tooltip.jsx";

import cx from "classnames";

// higher order component that takes a component which takes props "isOpen" and optionally "onClose"
// and returns a component that renders a <a> element "trigger", and tracks whether that component is open or not
export default ComposedComponent => class extends Component {
    static displayName = "Triggerable["+(ComposedComponent.displayName || ComposedComponent.name)+"]";

    constructor(props, context) {
        super(props, context);

        this.state = {
            isOpen: props.isInitiallyOpen || false
        }

        this._startCheckObscured = this._startCheckObscured.bind(this);
        this._stopCheckObscured = this._stopCheckObscured.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    static defaultProps = {
        closeOnObscuredTrigger: false
    };

    open() {
        this.toggle(true);
    }

    close() {
        this.toggle(false);
    }

    toggle(isOpen = !this.state.isOpen) {
        this.setState({ isOpen });
    }

    onClose(e) {
        // don't close if clicked the actual trigger, it will toggle
        if (e && e.target && ReactDOM.findDOMNode(this.refs.trigger).contains(e.target)) {
            return;
        }
        this.close();
    }

    target() {
        if (this.props.target) {
            return this.props.target();
        } else {
            return this.refs.trigger;
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.state.isOpen && this.props.closeOnObscuredTrigger) {
            this._startCheckObscured();
        } else {
            this._stopCheckObscured();
        }
    }

    componentWillUnmount() {
        this._stopCheckObscured();
    }

    _startCheckObscured() {
        if (this._offscreenTimer == null) {
            this._offscreenTimer = setInterval(() => {
                let trigger = ReactDOM.findDOMNode(this.refs.trigger);
                if (isObscured(trigger)) {
                    this.close();
                }
            }, 250);
        }
    }
    _stopCheckObscured() {
        if (this._offscreenTimer != null) {
            clearInterval(this._offscreenTimer);
            this._offscreenTimer = null;
        }
    }

    render() {
        const { triggerClasses, triggerClassesOpen } = this.props;
        const { isOpen } = this.state;

        let { triggerElement } = this.props;
        if (triggerElement && triggerElement.type === Tooltip) {
            // Disables tooltip when open:
            triggerElement = React.cloneElement(triggerElement, { isEnabled: triggerElement.props.isEnabled && !isOpen });
        }

        // if we have a single child which doesn't have an onClose prop go ahead and inject it directly
        let { children } = this.props;
        if (React.Children.count(children) === 1 && React.Children.only(children).props.onClose === undefined) {
            children = React.cloneElement(children, { onClose: this.onClose });
        }

        return (
            <a ref="trigger" onClick={() => this.toggle()} className={cx("no-decoration", triggerClasses, isOpen ? triggerClassesOpen : null)}>
                {triggerElement}
                <ComposedComponent
                    {...this.props}
                    children={children}
                    isOpen={isOpen}
                    onClose={this.onClose}
                    target={() => this.target()}
                />
            </a>
        );
    }
};
