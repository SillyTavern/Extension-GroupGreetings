function PickPopup({ onPick, list, name }) {
    return (
        <div className="flex-container flexFlowColumn">
            <h3>Pick a greeting for <span>{name}</span></h3>
            <hr />
            {list.map((text, index) => (
                <div key={index} className="flex-container alignItemsCenter">
                    <textarea
                        rows="6"
                        onClick={() => onPick(text)}
                        readOnly
                        className="right_menu_button justifyLeft textarea_compact autoSetHeight margin5 padding5"
                    >
                        {text}
                    </textarea>
                </div>
            ))}
        </div>
    );
}

export default PickPopup;
